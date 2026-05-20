import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for dynamic meta tags
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} [props.image] - Custom OG image
 * @param {string} [props.url] - Canonical URL/Relative path
 * @param {string} [props.keywords] - Custom page keywords
 * @param {string} [props.author] - Custom author name
 */
const SEO = ({ title, description, image, url = '', keywords = '', author = '', type = 'website', data = null }) => {
  const siteName = "QuizSphere";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const siteUrl = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://quizsphere.store";
  const defaultDescription = "QuizSphere - A production-grade community-based quiz management system developed by Rathanak Phan. Create, share, and play interactive quizzes.";
  const defaultImage = `${siteUrl}/logo.png`;
  
  const defaultKeywords = "Rathanak Phan, Phan Rathanak, QuizSphere, community quiz, interactive learning, quiz management system, gamified learning, Rathanak Phan portfolio, full stack developer, react quiz app";
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const finalAuthor = author || "Rathanak Phan (Phan Rathanak)";

  // Base Creator & Publisher schemas referencing Rathanak Phan
  const creatorSchema = {
    "@type": "Person",
    "name": "Rathanak Phan",
    "jobTitle": "Full Stack Developer",
    "url": siteUrl,
    "sameAs": [
      "https://github.com/rathanak-phan",
      "https://linkedin.com/in/rathanak-phan"
    ]
  };

  const publisherSchema = {
    "@type": "Organization",
    "name": siteName,
    "logo": {
      "@type": "ImageObject",
      "url": defaultImage
    }
  };

  // Schema.org Structured Data (JSON-LD) dynamically adjusted
  let schemaJson = {};

  if (type === 'quiz') {
    schemaJson = {
      "@context": "https://schema.org",
      "@type": "Quiz",
      "name": title || siteName,
      "description": description || defaultDescription,
      "image": image || defaultImage,
      "url": `${siteUrl}${url}`,
      "learningResourceType": "Quiz",
      "educationalUse": "Assessment",
      "creator": data?.creatorName ? {
        "@type": "Person",
        "name": data.creatorName
      } : creatorSchema,
      "publisher": publisherSchema,
      "about": {
        "@type": "Thing",
        "name": data?.categoryName || "General Knowledge"
      }
    };
  } else if (type === 'community') {
    schemaJson = {
      "@context": "https://schema.org",
      "@type": "Group",
      "name": title || siteName,
      "description": description || defaultDescription,
      "image": image || defaultImage,
      "url": `${siteUrl}${url}`,
      "publisher": publisherSchema
    };
  } else if (type === 'profile') {
    schemaJson = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "url": `${siteUrl}${url}`,
      "mainEntity": {
        "@type": "Person",
        "name": title || "User Profile",
        "description": description || "QuizSphere member profile",
        "image": image || null
      },
      "publisher": publisherSchema
    };
  } else {
    // Default WebSite schema with developer Rathanak Phan
    schemaJson = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": siteUrl,
      "description": description || defaultDescription,
      "creator": creatorSchema,
      "publisher": publisherSchema
    };
  }

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={finalAuthor} />
      <meta name="creator" content="Rathanak Phan" />
      <meta name="publisher" content="Rathanak Phan" />
      <meta name="copyright" content="Copyright © Rathanak Phan" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={`${siteUrl}${url}`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'quiz' ? 'article' : 'website'} />
      <meta property="og:url" content={`${siteUrl}${url}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`${siteUrl}${url}`} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaJson)}
      </script>
    </Helmet>
  );
};

export default SEO;
