"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setProjectFollow, setProjectSupport } from "../actions";
import {
  applyProjectReaction,
  type ProjectReaction,
  type ProjectReactionState,
} from "../lib/project-reactions";

type Labels = {
  follow: string;
  following: string;
  support: string;
  error: string;
};

type Props = {
  projectId: number;
  slug: string;
  initialFollowing: boolean;
  initialSupported: boolean;
  initialSupportCount: number;
  labels: Labels;
};

export function ProjectReactions({
  projectId,
  slug,
  initialFollowing,
  initialSupported,
  initialSupportCount,
  labels,
}: Props) {
  const [saved, setSaved] = useState<ProjectReactionState>({
    following: initialFollowing,
    supported: initialSupported,
    supportCount: initialSupportCount,
  });
  const [shown, showOptimistic] = useOptimistic(saved, applyProjectReaction);
  const [followPending, startFollow] = useTransition();
  const [supportPending, startSupport] = useTransition();
  const [error, setError] = useState("");

  function change(reaction: ProjectReaction) {
    const start = reaction.kind === "follow" ? startFollow : startSupport;

    start(async () => {
      setError("");
      showOptimistic(reaction);

      try {
        const result =
          reaction.kind === "follow"
            ? await setProjectFollow(projectId, slug, reaction.active)
            : await setProjectSupport(projectId, slug, reaction.active);

        if (!result.ok) {
          setError(labels.error);
          return;
        }

        setSaved((current) => applyProjectReaction(current, reaction));
      } catch {
        setError(labels.error);
      }
    });
  }

  return (
    <div className="project-reactions">
      <div className="hero-actions">
        <button
          className={`follow ${shown.following ? "is-on" : ""}`}
          type="button"
          aria-pressed={shown.following}
          aria-busy={followPending || undefined}
          disabled={followPending}
          onClick={() => change({ kind: "follow", active: !shown.following })}
        >
          {shown.following ? labels.following : labels.follow}
        </button>

        <button
          className={`boost ${shown.supported ? "is-on" : ""}`}
          type="button"
          aria-pressed={shown.supported}
          aria-busy={supportPending || undefined}
          aria-label={`${shown.supportCount} ${labels.support}`}
          disabled={supportPending}
          onClick={() => change({ kind: "support", active: !shown.supported })}
        >
          <span aria-hidden="true">♡</span>
          <strong>{shown.supportCount}</strong>
        </button>
      </div>
      {error ? <p className="reaction-error" role="alert">{error}</p> : null}
    </div>
  );
}
