<?php
//* This file will handle the logic for the queries using the models

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


class AuthService{

    //TODO Understand rehashing 
    //TODO Validate the user and continue doing the log in function


    public function register(array $data){

    $registeredUser =  User::create([
            "firstname" => $data["firstname"],
            "lastname" => $data["lastname"],
            "email" => $data["email"],
            "password" => Hash::make($data[ "password"])
        ]);

        return $registeredUser;
 
    }

    public function login(array $data){
        
        //Looks up in the users table with the credentials from the user
        

        //user credentials received [username , password]
        if(!Auth::attempt($data)){
            return null;
        }
         
        //returns the user that matches the credential
        $user = Auth::user();

        return $user;
    }
    
    public function logout(object $data){
        $user = $data -> user();

        $user -> currentAccessToken() -> delete();

    


    }

}

