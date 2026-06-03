package com.voidfuldawn.encountersofthevoid.controller;

import com.voidfuldawn.encountersofthevoid.model.HomeResource;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/v1")
public class ApiController {

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("status", "Everything is working.");
    }

    @GetMapping(value = "/home", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<HomeResource> home() {
        HomeResource resource = new HomeResource("Everything is working.");
        resource.add(linkTo(methodOn(ApiController.class).home()).withSelfRel());
        resource.add(linkTo(methodOn(ApiController.class).status()).withRel("status"));
        return ResponseEntity.ok(resource);
    }
}
