package com.React.Backend.Dao;


import com.React.Backend.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role,Long> {

    public Role findByRoleName(String roleName);


}
