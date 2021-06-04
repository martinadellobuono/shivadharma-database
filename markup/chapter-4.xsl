<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" indent="yes"/>
<xsl:template match="/">
  <xsl:for-each select="chapter">
  <html xmlns:foaf="http://xmlns.com/foaf/0.1/">
    <!-- head -->
    <head>
      <meta charset="utf-8"></meta>
      <title>Shivadharma database - Chapter <xsl:value-of select="concat(' ', ./@data-n)"/><xsl:value-of select="concat(' ', chapterheader/chaptertitle)"/></title>
      <link rel="stylesheet" type="text/css" href="script/bootstrap/css/bootstrap.min.css"></link>
      <link rel="stylesheet" type="text/css" href="style/style.css"></link>
    </head>
    <!-- chapter -->  
    <body>
      <!-- chapter header -->
      <xsl:variable name="chaptern">
        <xsl:value-of select="./@data-n"/>
      </xsl:variable>
      <h1>Chapter <xsl:value-of select="concat(' ', ./@data-n)"/></h1>  
      <h2><xsl:value-of select="chapterheader/chaptertitle"/></h2>
      <h3><xsl:value-of select="chapterheader/chaptersubtitle"/></h3>
      <!-- chapter corpus -->  
      <xsl:for-each select="chaptercorpus/dialogline">
      <section>
        <!-- avuca -->  
        <h4>
          <span data-bs-toggle="tooltip" data-bs-placement="top" property="foaf:Person">
            <xsl:attribute name="title">
              <xsl:value-of select="speaker/person"/>
            </xsl:attribute>
            <xsl:value-of select="speaker"/>
          </span>
        </h4>
        <!-- dialog line -->  
        <xsl:for-each select="line">
        <!-- verse -->  
        <p>
          <span class="fw-lighter f-xs me-2"><xsl:value-of select="concat(position(), ' ')"/></span>
          <xsl:choose>
            <!-- if even verse -->          
            <xsl:when test="(position() mod 2) != 1">
              <xsl:value-of select="concat(verse, ' ||', $chaptern , '.', (position() div 2), '|| ')"/> 
              <sup>
                <a data-bs-toggle="collapse" role="button" aria-expanded="false">
                <xsl:attribute name="href">
                  <xsl:value-of select="concat('#', replace(verse,'[^a-zA-Z]',''), '-', position())"/>
                </xsl:attribute>
                <xsl:value-of select="position()"/> 
                </a>
              </sup>
            </xsl:when>
            <!-- if odd verse -->          
            <xsl:otherwise>
              <xsl:value-of select="concat(verse, ' |')"/> 
              <sup>
                <a data-bs-toggle="collapse" role="button" aria-expanded="false">
                <xsl:attribute name="href">
                  <xsl:value-of select="concat('#', replace(verse,'[^a-zA-Z]',''), '-', position())"/>
                </xsl:attribute>
                <xsl:value-of select="position()"/> 
                </a>
              </sup>
            </xsl:otherwise>
          </xsl:choose>
        </p>
        <!-- note -->
        <p class="collapse">
          <xsl:attribute name="id">
            <xsl:value-of select="concat(replace(verse,'[^a-zA-Z]',''), '-', position())"/>
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
      <script src="script/bootstrap/js/popper.min.js"></script>
      <script>
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl)
        })
      </script>
    </body>
  </html>
  </xsl:for-each>
</xsl:template>
</xsl:stylesheet>
