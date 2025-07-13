/**
 * Related articles component styles
 */
export const articlesStyles = `
  /* Related Articles */
  .agentary-related-articles {
  }

  .agentary-related-articles-wrapper {
    position: relative;
  }

  .agentary-related-articles-header {
    font-size: var(--agentary-font-size-md);
    font-weight: 600;
    color: var(--agentary-text-color);
    margin-bottom: var(--agentary-spacing-lg);
    text-align: center;
  }

  .agentary-related-articles-carousel {
  }

  .agentary-related-articles-container {
    display: flex;
    gap: var(--agentary-spacing-sm);
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
    width: 100%;
    max-width: 100%;
  }

  .agentary-related-articles-container::-webkit-scrollbar {
    display: none;
  }

  .agentary-related-article-card {
    flex: 0 0 100%;
    height: 160px;
    padding: 0;
    box-sizing: border-box;
    scroll-snap-align: start;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .agentary-related-article-card:hover {
    opacity: 0.85;
  }

  .agentary-related-article-image-bg {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url('./public/img/article-placeholder.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: flex-end;
    border-radius: var(--agentary-border-radius);
    overflow: hidden;
    cursor: pointer;
  }

  .agentary-related-article-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  /* Light overlay for skeleton loading state */
  .agentary-skeleton .agentary-related-article-overlay {
    background: linear-gradient(
      180deg,
      rgba(248, 249, 250, 0.1) 0%,
      rgba(248, 249, 250, 0.3) 50%,
      rgba(248, 249, 250, 0.7) 100%
    );
  }

  .agentary-related-article-content {
    position: relative;
    z-index: 2;
    padding: var(--agentary-spacing-lg);
    color: white;
    width: 100%;
  }

  .agentary-related-article-title {
    font-weight: 500;
    font-size: var(--agentary-font-size-lg);
    line-height: 1.3;
    margin-bottom: var(--agentary-spacing-sm);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .agentary-related-article-summary {
    font-size: var(--agentary-font-size-sm);
    font-weight: 400;
    line-height: 1.4;
    margin-bottom: var(--agentary-spacing-xs);
    opacity: 0.85;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .agentary-related-article-source {
    font-size: var(--agentary-font-size-sm);
    font-weight: 600;
    opacity: 0.9;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .agentary-related-articles-navigation {
    display: flex;
    justify-content: center;
    margin-top: var(--agentary-spacing-md);
  }

  .agentary-related-articles-dots {
    display: flex;
    gap: var(--agentary-spacing-xs);
  }

  .agentary-related-articles-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--agentary-border-color);
    cursor: pointer;
    transition: background-color var(--agentary-transition-fast);
  }

  .agentary-related-articles-dot.agentary-active,
  .agentary-related-articles-dot:hover {
    background-color: var(--agentary-primary-color);
  }

  /* Fade-in animation for loaded articles */
  .agentary-articles-fade-in {
    animation: agentaryArticlesFadeIn 0.6s ease-out forwards;
  }

  @keyframes agentaryArticlesFadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`; 