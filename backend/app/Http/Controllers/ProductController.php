<?php

namespace App\Http\Controllers;

use App\Services\ProductService;
use App\Http\Requests\AddProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    public function __construct(private ProductService $productService)
    {
    }
    public function list()
    {

        $products = $this->productService->list();

        return response(["products" => $products]);


    }

    public function add(AddProductRequest $request)
    {
        $added_product = $this->productService->add($request->validated());

        if (!$added_product) {
            return response()->json(["message" => "Product not"]);

        }
        return response()->json(["message" => "Product Added", "product" => $added_product]);


    }

    public function update(UpdateProductRequest $request, int $id)
    {
        $updated_product = $this->productService->update($request->validated(), $id);

        if (!$updated_product) {
            return response()->json(["message" => "Error updating product"]);

        }

        return response()->json(["message" => "Product Updated", "product" => $updated_product]);
    }

    public function delete()
    {

    }
}
