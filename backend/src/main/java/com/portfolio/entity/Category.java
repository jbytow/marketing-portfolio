package com.portfolio.entity;

public enum Category {
    CAMPAIGNS("Campaigns", "Kampanie"),
    CONTENT_COPY("Content & Copy", "Treści i Copywriting"),
    NEWSLETTER("Newsletter", "Newsletter");

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
