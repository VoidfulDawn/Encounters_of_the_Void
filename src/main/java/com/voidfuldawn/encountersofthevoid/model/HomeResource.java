package com.voidfuldawn.encountersofthevoid.model;

import org.springframework.hateoas.RepresentationModel;

public class HomeResource extends RepresentationModel<HomeResource> {

    private final String status;

    public HomeResource(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
