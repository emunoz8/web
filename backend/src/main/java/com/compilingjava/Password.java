package com.compilingjava;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Password {

    public static void main(String[] args) {
        System.out.println();
        System.out.println(new BCryptPasswordEncoder().encode("VWjetta2002!!@@"));
    }

}
