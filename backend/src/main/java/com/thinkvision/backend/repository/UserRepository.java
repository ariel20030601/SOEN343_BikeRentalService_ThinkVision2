package com.thinkvision.backend.repository;

import com.thinkvision.backend.entity.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Integer> {
}
