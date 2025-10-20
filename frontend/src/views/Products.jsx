import { useState, useEffect } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import instance from "../axiosClient";

ModuleRegistry.registerModules([AllCommunityModule]);

// Create new GridExample component
const Products = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([]);
  const [productName, setProductName] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();
  const [stock, setStock] = useState();
  const [image, setImage] = useState();

  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState([
    { field: "image", headerName: "Image", cellRenderer: ImageRenderer },
    { field: "product_id", headerName: "ID" },
    { field: "product_name", headerName: "Product Name", flex: 2 },
    { field: "description", headerName: "Description" },
    { field: "price", headerName: "Price" },
    { field: "stock", headerName: "Stock" },
    { field: "isActive", headerName: "Is Active" },
    {
      headerName: "Actions",
      cellRenderer: ActionsRenderer,
      cellStyle: {
        display: "flex",
        alignItems: "center",
      },
      field: "product_id",
    },
  ]);

  const defaultColDef = {
    flex: 1,
  };

  useEffect(() => {
    const getProducts = async () => {
      const request = await instance.get("/products/list");
      const { products } = request.data;
      setRowData(products);
    };
    getProducts();
  }, []);

  //TODO Currently handling image url upload
  const handleAdd = (url) => {
    const payload = {
      product_name: productName,
      description: description,
      quantity: stock,
      price,
      image: url,
    };

    console.log(payload);

    try {
      const addProduct = async () => {
        const request = await instance.post("/products/add", payload);
        const { added } = request.data;
        console.log(added);
      };

      addProduct();
    } catch (error) {
      console.error("Error While Adding:", error);
    }
  };

  const handleFileUpload = async () => {
    try {
      if (!image) return;
      const actualImage = image[0];
      const data = new FormData();
      //"file" is a fixed keyword for cloudinary
      data.append("file", actualImage);
      //The preset in the cloudinary upload preset section
      data.append("upload_preset", "demo_image");
      //cloud name is in API keys section then Cloud name:
      data.append("cloud_name", "dwuelxoyn");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dwuelxoyn/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      if (res) {
        console.log("Image Uploaded:");
        const response = await res.json();
        const { url } = response;

        handleAdd(url);
      }
    } catch (error) {
      console.error("Error occured while uploading image:", error);
    }
  };

  // Container: Defines the grid's theme & dimensions.
  return (
    <div className="flex justify-center mt-2 flex-col items-center ">
      {/* Modal Trigger */}
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn btn-soft btn-primary self-end mr-10 mb-2 "
        onClick={() => document.getElementById("my_modal_5").showModal()}
      >
        Add Product
      </button>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box flex flex-col gap-5">
          <h3 className="font-bold text-lg text-center">
            Enter Product Details
          </h3>
          <section className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              className="input"
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="input"
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Price"
              className="input"
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantity"
              className="input"
              onChange={(e) => setStock(e.target.value)}
            />

            <input
              type="file"
              className="file-input "
              onChange={(e) => setImage(e.target.files)}
            />
          </section>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
            <button className="btn" onClick={() => handleFileUpload()}>
              Add Product
            </button>
          </div>
        </div>
      </dialog>

      <div style={{ width: 1200, height: 600 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          rowHeight={70}
        />
      </div>
    </div>
  );
};

const ImageRenderer = (params) => {
  const rowData = params.value;

  return (
    <div className="flex items-center justify-center h-full">
      <img className="h-full   w-20 rounded-xl " src={rowData}></img>
    </div>
  );
};

const ActionsRenderer = (params) => {
  const product_id = params.value;

  const handleForm = async (mode) => {
    if (mode === "update") {
      try {
        const request = await instance.patch(`products/${product_id}`, );
      } catch (error) {
        console.error("Error updating user:", error);
      }
    } else {
      try {
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Pencil Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        class="size-6 hover:opacity-50 cursor-pointer"
        name="Update"
        onClick={() => handleForm("update")}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        />
      </svg>
      {/* Trash Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6 hover:opacity-50 cursor-pointer"
        name="Delete"
        onClick={() => handleForm("delete")}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    </div>
  );
};
export default Products;
