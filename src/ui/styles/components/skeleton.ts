/**
 * Skeleton loading component styles
 */
export const skeletonStyles = `
  /* Skeleton loading animation */
  .agentary-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
  }

  .agentary-skeleton-article {
    flex: 0 0 100%;
    height: 160px;
    padding: 0 var(--agentary-spacing-sm);
    box-sizing: border-box;
    scroll-snap-align: start;
  }

  .agentary-skeleton-article-bg {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: var(--agentary-border-radius);
    overflow: hidden;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
  }

  .agentary-skeleton-content {
    position: absolute;
    bottom: var(--agentary-spacing-lg);
    left: var(--agentary-spacing-lg);
    right: var(--agentary-spacing-lg);
    z-index: 2;
  }

  .agentary-skeleton-title {
    height: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.8) 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
    border-radius: 4px;
    margin-bottom: var(--agentary-spacing-xs);
  }

  .agentary-skeleton-title-short {
    width: 75%;
    height: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.8) 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
    border-radius: 4px;
    margin-bottom: var(--agentary-spacing-sm);
  }

  .agentary-skeleton-source {
    width: 50%;
    height: 12px;
    background: linear-gradient(90deg, rgba(255,255,255,0.7) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.7) 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
    border-radius: 4px;
  }

  @keyframes agentarySkeletonLoading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`; 