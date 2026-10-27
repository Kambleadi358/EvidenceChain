package com.evidencechain.repository;

import com.evidencechain.model.Role;
import com.evidencechain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);

    /**
     * Startup cleanup: migrates any legacy FEDERAL users to POLICE so existing
     * ./data databases stay valid after the FEDERAL role was removed.
     */
    @Modifying
    @Query(value = "UPDATE users SET role = 'POLICE' WHERE role = 'FEDERAL'", nativeQuery = true)
    int migrateFederalUsersToPolice();
}
