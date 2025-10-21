/**
 * Sound Hook - Mock implementation
 * @author Ona AI
 */

export function useSound() {
  const play = () => {
    // Mock sound play
    console.log('Sound played');
  };

  return { play };
}
