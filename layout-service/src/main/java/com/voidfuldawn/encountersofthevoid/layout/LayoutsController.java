package com.voidfuldawn.encountersofthevoid.layout;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/layouts")
public class LayoutsController {

    @GetMapping("/")
    public ResponseEntity<CollectionModel<EntityModel<String>>> getAll() {
        CollectionModel<EntityModel<String>> collection = CollectionModel.of(
            Collections.emptyList(),
            linkTo(methodOn(LayoutsController.class).getAll()).withSelfRel()
        );
        return ResponseEntity.ok(collection);
    }
}
