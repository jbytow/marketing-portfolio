package com.portfolio.entity;

public enum Category {
    ABOUT_ME("About Me", "O mnie"),
    EXPERIENCE("Experience", "Doświadczenie"),
    CAMPAIGNS("Campaigns", "Kampanie"),
    INFLUENCE_MARKETING("Influence Marketing", "Influence Marketing"),
    CASE_STUDY("Case Studies", "Case Studies"),
    CONTENT_COPY("Content & Copy", "Treści i Copywriting"),
    SOFT_SKILLS("Soft Skills", "Umiejętności miękkie");

    private final String labelEn;
    private final String labelPl;

    Category(String labelEn, String labelPl) {
        this.labelEn = labelEn;
        this.labelPl = labelPl;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public String getLabelPl() {
        return labelPl;
    }

    public String getLabel(String locale) {
        return "pl".equalsIgnoreCase(locale) ? labelPl : labelEn;
    }
}
