<?php

namespace App\Services;
use App\Models\Product;

class ProductService
{

    public function list()
    {
        $products = Product::all();

        return $products;

    }


    public function add(array $data)
    {
        $added_product = Product::create([
            'product_name' => $data["product_name"],
            'description' => $data["description"],
            'price' => $data["price"],
            'stock' => $data["quantity"],
            'isActive' => true,
            'image' => $data["image"],


        ]);

        return $added_product;
    }

    public function update(array $data, int $id)
    {
        $product = Product::findOrFail($id);

        if (!$product) {
            return null;

        }

        //get fields that are only fillable in the model

        //Updates the specific product

        $product->update($data);

        return $product;
    }
}

