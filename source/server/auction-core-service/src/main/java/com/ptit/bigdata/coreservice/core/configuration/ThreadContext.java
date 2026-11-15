package com.ptit.bigdata.coreservice.core.configuration;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class ThreadContext {
    public static final ThreadLocal<UserDetails> userHolder = new ThreadLocal<>();

    public static UserDetails getUserDetail() {
        return userHolder.get();
    }

    public static void setUserDetail(UserDetails userDetails) {
        userHolder.set(userDetails);
    }

    public static Long getCurrentUserId() {
        UserDetails ud = userHolder.get();
        if (ud instanceof User u) {
            return u.getId();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) {
            return u.getId();
        }
        return null;
    }

    public static User getCurrentUser() {
        UserDetails ud = userHolder.get();
        if (ud instanceof User u) {
            return u;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) {
            return u;
        }
        return null;
    }
}

