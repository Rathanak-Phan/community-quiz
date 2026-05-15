import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for dynamic meta tags
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} [props.image] - Custom OG image
 * @param {string} [props.url] - Canonical URL/Relative path
 */
const SEO = ({ title, description, image, url = '' }) => {
  const siteName = "QuizSphere";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const siteUrl = "https://quizsphere.store";
  const defaultDescription = "Community Quiz - A platform for interactive learning and community-driven quizzes.";
  const defaultImage = `${siteUrl}/logo.png`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={`${siteUrl}${url}`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${siteUrl}${url}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`${siteUrl}${url}`} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;
