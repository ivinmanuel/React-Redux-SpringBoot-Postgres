package com.React.Backend.Service;




import com.React.Backend.Entity.User;
import com.React.Backend.Entity.UserRole;

import java.util.List;
import java.util.Set;

public interface UserService {


    public User createUser(User user, Set<UserRole>userRoles) throws Exception;

    public User getUser(String userName);

    public List<User> getAllUsers();

    public User getUser(long id);

    User updateUser(User user);


    public void updateImage(User user,String fileName);


    void userdelete(Long id);


    User editUser(Long id);

    void updateEdit(User user);

    List<User> search(String name);
}
