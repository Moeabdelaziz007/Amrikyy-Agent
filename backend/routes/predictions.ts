import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

/**
 * GET /api/predictions/:userId
 * Fetch active predictions for a specific user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`[Predictions API] Fetching predictions for user: ${userId}`);

    // Fetch predictions from database
    const { data: predictions, error: predictionsError } = await supabase
      .from('trip_predictions')
      .select(
        `
        *,
        outcome_predictions(
          predicted_satisfaction,
          confidence_level,
          specific_warnings,
          predictions
        )
      `
      )
      .eq('user_id', userId)
      .eq('prediction_status', 'نشط')
      .order('predicted_at', { ascending: false })
      .limit(10);

    if (predictionsError) {
      console.error(
        '[Predictions API] Error fetching predictions:',
        predictionsError
      );
      throw predictionsError;
    }

    // Fetch user persona
    const { data: persona, error: personaError } = await supabase
      .from('traveler_personas')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (personaError && personaError.code !== 'PGRST116') {
      // PGRST116 = no rows
      console.warn('[Predictions API] Error fetching persona:', personaError);
    }

    // Format predictions for frontend
    const formattedPredictions = (predictions || []).map((pred) => {
      const outcomeData = pred.outcome_predictions?.[0];
      const predictedDates =
        typeof pred.predicted_dates === 'string'
          ? JSON.parse(pred.predicted_dates)
          : pred.predicted_dates;
      const budgetRange =
        typeof pred.predicted_budget_range === 'string'
          ? JSON.parse(pred.predicted_budget_range)
          : pred.predicted_budget_range;
      const reasoning =
        typeof pred.prediction_reasoning === 'string'
          ? JSON.parse(pred.prediction_reasoning)
          : pred.prediction_reasoning;

      return {
        id: pred.id,
        destination: pred.predicted_destination,
        checkIn: predictedDates?.check_in || null,
        checkOut: predictedDates?.check_out || null,
        budgetRange: [budgetRange?.min || 80, budgetRange?.max || 150],
        confidence: predictedDates?.confidence || 0.75,
        reasoning: reasoning?.factors ||
          reasoning?.patterns_detected || [
            'بناءً على أنماط سفرك السابقة',
            'موسم مثالي لهذه الوجهة',
            'أسعار مناسبة حالياً',
          ],
        aiScore: outcomeData?.predicted_satisfaction
          ? Math.round(outcomeData.predicted_satisfaction * 10)
          : 85,
        warnings: outcomeData?.specific_warnings || [],
        status: pred.prediction_status,
        predictedAt: pred.predicted_at,
        expiresAt: pred.expires_at,
      };
    });

    // Format persona data
    const formattedPersona = persona
      ? {
          type: persona.persona_types?.[0] || 'مسافر',
          confidence: persona.confidence_score || 0.5,
          traits: persona.persona_types || [],
          travelStyle: persona.travel_style,
          budgetTier: persona.budget_tier,
        }
      : {
          type: 'مسافر',
          confidence: 0.5,
          traits: [],
          travelStyle: null,
          budgetTier: null,
        };

    console.log(
      `[Predictions API] Returning ${formattedPredictions.length} predictions`
    );

    res.json({
      success: true,
      predictions: formattedPredictions,
      persona: formattedPersona,
      total: formattedPredictions.length,
    });
  } catch (error: any) {
    console.error('[Predictions API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch predictions',
      message: error.message,
    });
  }
});

/**
 * POST /api/predictions/accept/:id
 * User accepted a prediction - prepare automation data
 */
router.post('/accept/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[Predictions API] Accepting prediction: ${id}`);

    // Fetch prediction details
    const { data: prediction, error } = await supabase
      .from('trip_predictions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Predictions API] Error fetching prediction:', error);
      throw error;
    }

    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Prediction not found',
      });
    }

    // Parse JSON fields
    const predictedDates =
      typeof prediction.predicted_dates === 'string'
        ? JSON.parse(prediction.predicted_dates)
        : prediction.predicted_dates;
    const budgetRange =
      typeof prediction.predicted_budget_range === 'string'
        ? JSON.parse(prediction.predicted_budget_range)
        : prediction.predicted_budget_range;

    // Prepare trip data for automation
    const tripData = {
      destination: prediction.predicted_destination,
      checkIn: predictedDates?.check_in,
      checkOut: predictedDates?.check_out,
      travelers: 2, // Default, can be customized
      budget: budgetRange?.max || 150,
    };

    // Update prediction status (optional - track that user clicked)
    await supabase.from('user_behavior_log').insert({
      user_id: prediction.user_id,
      action_type: 'إكمال_حجز',
      action_data: {
        prediction_id: id,
        destination: tripData.destination,
        accepted: true,
      },
      timestamp: new Date().toISOString(),
    });

    console.log(
      `[Predictions API] Prediction accepted, returning automation data`
    );

    // Return automation trigger data
    res.json({
      success: true,
      automationUrl: `/api/automation/search-hotels?prediction_id=${id}`,
      tripData,
      predictionId: id,
    });
  } catch (error: any) {
    console.error('[Predictions API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept prediction',
      message: error.message,
    });
  }
});

/**
 * POST /api/predictions/:id/dismiss
 * User dismissed a prediction
 */
router.post('/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(`[Predictions API] Dismissing prediction: ${id}`);

    // Update prediction status
    const { error } = await supabase
      .from('trip_predictions')
      .update({
        prediction_status: 'تم_التجاهل',
        user_feedback: reason || 'Dismissed by user',
      })
      .eq('id', id);

    if (error) throw error;

    // Log behavior
    const { data: prediction } = await supabase
      .from('trip_predictions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (prediction) {
      await supabase.from('user_behavior_log').insert({
        user_id: prediction.user_id,
        action_type: 'إلغاء_حجز',
        action_data: {
          prediction_id: id,
          reason: reason || 'dismissed',
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: 'Prediction dismissed',
    });
  } catch (error: any) {
    console.error('[Predictions API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss prediction',
      message: error.message,
    });
  }
});

/**
 * GET /api/predictions/stats/:userId
 * Get prediction accuracy stats for user
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all user predictions
    const { data: predictions, error } = await supabase
      .from('trip_predictions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: predictions?.length || 0,
      active:
        predictions?.filter((p) => p.prediction_status === 'نشط').length || 0,
      completed:
        predictions?.filter((p) => p.prediction_status === 'تم_الحجز').length ||
        0,
      dismissed:
        predictions?.filter((p) => p.prediction_status === 'تم_التجاهل')
          .length || 0,
      avgAccuracy:
        predictions
          ?.filter((p) => p.accuracy_score)
          .reduce((acc, p) => acc + (p.accuracy_score || 0), 0) /
        (predictions?.filter((p) => p.accuracy_score).length || 1),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[Predictions API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message,
    });
  }
});

export default router;
