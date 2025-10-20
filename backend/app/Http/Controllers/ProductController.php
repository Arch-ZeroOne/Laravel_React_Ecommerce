<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\ProductService;

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

    public function add()
    {


    }

    public function update()
    {

    }

    public function delete()
    {

    }
}
