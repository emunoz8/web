package com.compilingjava;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    @GetMapping("/api/greeting")
    public String greeting() {
        return "Hello and Welcome to my Website";
    }
}
