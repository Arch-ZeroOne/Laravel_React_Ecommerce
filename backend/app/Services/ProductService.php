<?php

namespace App\Services;
use App\Models\Product;

class ProductService{

    public function list(){
        $products = Product::all();

        return $products;

    }
}

