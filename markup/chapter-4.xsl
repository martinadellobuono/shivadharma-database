<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" indent="yes"/>
<xsl:template match="/">
  <xsl:for-each select="chapter">
  <html>
    <!-- head -->
    <head>
      <meta charset="utf-8"></meta>
      <title>Shivadharma database - <xsl:value-of select="chapterheader/chaptertitle"/></title>
      <link rel="stylesheet" type="text/css" href="script/bootstrap/css/bootstrap.min.css"></link>
      <link rel="stylesheet" type="text/css" href="style/style.css"></link>
    </head>
    <!-- chapter -->  
    <body>
      <!-- chapter header -->  
      <h1><xsl:value-of select="chapterheader/chaptertitle"/></h1>
      <h2><xsl:value-of select="chapterheader/chaptersubtitle"/></h2>
      <!-- chapter corpus -->  
      <xsl:for-each select="chaptercorpus/dialogline">
      <section>
        <!-- avuca -->  
        <h3><xsl:value-of select="speaker"/></h3>
        <!-- dialog line -->  
        <xsl:for-each select="line">
        <!-- verse -->  
        <p>
          <span class="fw-lighter f-xs me-2"><xsl:value-of select="concat(position(), ' ')"/></span>
          <xsl:value-of select="verse"/> 
          <sup>
            <a data-bs-toggle="collapse" role="button" aria-expanded="false">
            <xsl:attribute name="href">
              <xsl:value-of select="concat('#', replace(verse,'[^a-zA-Z]',''), '-', position())" />
            </xsl:attribute>
            <xsl:value-of select="position()"/> 
            </a>
          </sup>
        </p>
        <!-- note -->
        <p class="collapse">
          <xsl:attribute name="id">
            <xsl:value-of select="concat(replace(verse,'[^a-zA-Z]',''), '-', position())" />
          </xsl:attribute>
          <sup>
            <xsl:value-of select="concat(position(), ' ')"/>
          </sup>
          <xsl:value-of select="note"/>
        </p>
        </xsl:for-each>
      </section>
      </xsl:for-each>
      <!-- script -->
      <script src="script/jquery/jquery.js"></script>
      <script src="script/bootstrap/js/bootstrap.bundle.min.js"></script>
    </body>
  </html>
  </xsl:for-each>
</xsl:template>
</xsl:stylesheet>
