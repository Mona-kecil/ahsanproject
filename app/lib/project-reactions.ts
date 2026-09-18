export type ProjectReactionState = {
  following: boolean;
  supported: boolean;
  supportCount: number;
};

export type ProjectReaction =
  | { kind: "follow"; active: boolean }
  | { kind: "support"; active: boolean };

/** Apply the state the visitor asked for, without double-counting retries. */
export function applyProjectReaction(
  state: ProjectReactionState,
  reaction: ProjectReaction,
): ProjectReactionState {
  if (reaction.kind === "follow") {
    return { ...state, following: reaction.active };
  }

  const difference = Number(reaction.active) - Number(state.supported);
  return {
    ...state,
    supported: reaction.active,
    supportCount: Math.max(0, state.supportCount + difference),
  };
}
