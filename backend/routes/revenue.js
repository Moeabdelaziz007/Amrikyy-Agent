const express = require('express');
const router = express.Router();

// Mock data for revenue opportunities
const revenueOpportunities = [
  {
    id: 'opp-001',
    title: 'Upsell premium travel insurance',
    description: 'Offer premium travel insurance to customers booking flights to high-risk destinations.',
    value: 50000,
    probability: 0.75,
    status: 'open'
  },
  {
    id: 'opp-002',
    title: 'Promote luxury hotel packages in Dubai',
    description: 'Targeted campaign for luxury hotel packages for users who have previously searched for Dubai.',
    value: 120000,
    probability: 0.6,
    status: 'open'
  },
  {
    id: 'opp-003',
    title: 'Exclusive access to airport lounges',
    description: 'Partner with airport lounges to offer exclusive access to our frequent flyers.',
    value: 75000,
    probability: 0.8,
    status: 'in-progress'
  }
];

/**
 * @swagger
 * /api/revenue/opportunities:
 *   get:
 *     summary: Retrieve a list of revenue opportunities
 *     description: Fetches a list of potential revenue-generating opportunities, including upsells, promotions, and partnerships.
 *     tags: [Revenue]
 *     responses:
 *       200:
 *         description: A list of revenue opportunities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier for the opportunity.
 *                   title:
 *                     type: string
 *                     description: The title of the opportunity.
 *                   description:
 *                     type: string
 *                     description: A brief description of the opportunity.
 *                   value:
 *                     type: number
 *                     description: The estimated potential value of the opportunity in USD.
 *                   probability:
 *                     type: number
 *                     description: The probability of successfully converting the opportunity (from 0 to 1).
 *                   status:
 *                     type: string
 *                     description: The current status of the opportunity (e.g., open, in-progress, closed).
 */
router.get('/opportunities', (req, res) => {
  res.json(revenueOpportunities);
});

module.exports = router;
