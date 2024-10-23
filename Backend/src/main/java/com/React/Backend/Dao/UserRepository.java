package com.React.Backend.Dao;


import com.React.Backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    @Query("select u from User u where u.username= :username")
    public User findByUsername(String username);


    @Query("select u from User u where u.deleted=false ")
    public List<User> findAllBy();


    User getUserById(long id);

    @Query("select u from  User u where  u.id=:id")
    User findbyid(Long id);

    @Query("SELECT c FROM User c WHERE c.firstName LIKE :search ")
    Optional<User> findbyusername( String search);
    List<User> findByUsernameStartingWith(String name);
    List<User> findByFirstNameStartingWithAndDeletedIsFalse(String name);

}

