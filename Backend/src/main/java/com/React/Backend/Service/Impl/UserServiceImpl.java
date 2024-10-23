package com.React.Backend.Service.Impl;




import com.React.Backend.Dao.RoleRepository;
import com.React.Backend.Dao.UserRepository;
import com.React.Backend.Entity.Role;
import com.React.Backend.Entity.User;
import com.React.Backend.Entity.UserRole;
import com.React.Backend.Service.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;

    private RoleRepository roleRepository;

    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
                           BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.bCryptPasswordEncoder=bCryptPasswordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public User createUser(User user, Set<UserRole> userRoles){


        User local=userRepository.findByUsername(user.getUsername());


        if(local !=null){
            System.out.println("user is already there");
            throw new DataIntegrityViolationException("User is already present in database");
        }else{

            for (UserRole userRole : userRoles) {
                Role role = userRole.getRole();
                if (role == null) {
                    continue; // Skip saving this UserRole
                }
                roleRepository.save(role);
            }

            System.out.println("after loop");
            user.getUserRoles().addAll(userRoles);
            user.setImage("default.png");
            user.setEnabled(true);
            user.setDeleted(false);
            user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));

            local=userRepository.save(user);
            System.out.println("New Account created");
        }

        return local;
    }


    @Override
    public User getUser(String userName) {
        System.out.println(userName);
        User user= userRepository.findByUsername(userName);
        System.out.println(user);
        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAllBy();
    }

    @Override
    public User getUser(long id) {
        return userRepository.getUserById(id);
    }



    @Override
    public User updateUser(User user) {
        // Find the user by ID instead of username (use the ID passed in the request)
        Optional<User> optionalUser = userRepository.findById(user.getId());


        User existingUser = optionalUser.get();

        // Update only the fields provided in the request
        existingUser.setUsername(user.getUsername());
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhoneNumber(user.getPhoneNumber());
        existingUser.setImage(user.getImage());

        // Save the updated user
        userRepository.save(existingUser);

        return existingUser;
    }



    @Override
    public void updateImage(User user, String fileName) {
        User user1=userRepository.findByUsername(user.getUsername());
        user1.setImage(fileName);
        userRepository.save(user1);

    }

    @Override
    public void userdelete(Long id) {
      User user=  userRepository.findbyid(id);
         user.setDeleted(true);
         user.setEnabled(false);
         userRepository.save(user);
    }

    @Override
    public User editUser(Long id) {
        User user=userRepository.findbyid(id);

        return user;
    }

    @Override
    public void updateEdit(User user1) {
         User user= userRepository.findbyid(user1.getId());
         user1.setPassword(user.getPassword());
         user1.setUsername(user.getUsername());
         user1.setDeleted(false);
         user1.setEnabled(true);

        userRepository.save(user1);
    }

    @Override
    public List<User> search(String name) {
        List<User> user1=  userRepository.findByFirstNameStartingWithAndDeletedIsFalse(name);
        
        return user1;
    }


}
