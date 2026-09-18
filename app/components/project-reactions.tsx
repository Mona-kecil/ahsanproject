"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setProjectBoost, setProjectFollow } from "../actions";
import {
  applyProjectReaction,
  type ProjectReaction,
  type ProjectReactionState,
} from "../lib/project-reactions";

type Labels = {
  follow: string;
  following: string;
  support: string;
  followers: string;
  error: string;
};

type Props = {
  projectId: number;
  initialFollowing: boolean;
  initialFollowerCount: number;
  initialBoosted: boolean;
  initialBoostCount: number;
  labels: Labels;
};

export function ProjectReactions({
  projectId,
  initialFollowing,
  initialFollowerCount,
  initialBoosted,
  initialBoostCount,
  labels,
}: Props) {
  const [saved, setSaved] = useState<ProjectReactionState>({
    following: initialFollowing,
    followerCount: initialFollowerCount,
    boosted: initialBoosted,
    boostCount: initialBoostCount,
  });
  const [shown, showOptimistic] = useOptimistic(saved, applyProjectReaction);
  const [followPending, startFollow] = useTransition();
  const [boostPending, startBoost] = useTransition();
  const [error, setError] = useState("");
  const followFallback = setProjectFollow.bind(null, projectId, !shown.following);
  const boostFallback = setProjectBoost.bind(null, projectId, !shown.boosted);

  function change(reaction: ProjectReaction) {
    const start = reaction.kind === "follow" ? startFollow : startBoost;

    start(async () => {
      setError("");
      showOptimistic(reaction);

      try {
        await (reaction.kind === "follow"
          ? setProjectFollow(projectId, reaction.active)
          : setProjectBoost(projectId, reaction.active));

        setSaved((current) => applyProjectReaction(current, reaction));
      } catch {
        setError(labels.error);
      }
    });
  }

  return (
    <div className="project-reactions">
      <div className="hero-actions">
        <form
          action={followFallback}
          onSubmit={(event) => {
            event.preventDefault();
            change({ kind: "follow", active: !shown.following });
          }}
        >
          <button
            className={`follow ${shown.following ? "is-on" : ""}`}
            type="submit"
            aria-pressed={shown.following}
            aria-busy={followPending || undefined}
            disabled={followPending}
          >
            {shown.following ? labels.following : labels.follow}
          </button>
        </form>

        <form
          action={boostFallback}
          onSubmit={(event) => {
            event.preventDefault();
            change({ kind: "boost", active: !shown.boosted });
          }}
        >
          <button
            className={`boost ${shown.boosted ? "is-on" : ""}`}
            type="submit"
            aria-pressed={shown.boosted}
            aria-busy={boostPending || undefined}
            aria-label={`${shown.boostCount} ${labels.support}`}
            disabled={boostPending}
          >
            <span aria-hidden="true">♡</span>
            <strong>{shown.boostCount}</strong>
          </button>
        </form>
      </div>
      {error ? <p className="reaction-error" role="alert">{error}</p> : null}
      {shown.followerCount > 0 ? (
        <p className="follower-count">
          {shown.followerCount} {labels.followers}
        </p>
      ) : null}
    </div>
  );
}
