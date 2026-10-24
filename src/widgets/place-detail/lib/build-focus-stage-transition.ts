const FOCUS_STAGE_TRANSITION = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

/**
 * Это хелпер. Выбирает transition preview с учётом пользовательской настройки движения.
 *
 * @param shouldReduceMotion - Нужно ли переключать preview без анимации.
 * @returns Настройки transition для Motion.
 */
export function buildFocusStageTransition(shouldReduceMotion: boolean) {
  return shouldReduceMotion ? { duration: 0 } : FOCUS_STAGE_TRANSITION;
}
