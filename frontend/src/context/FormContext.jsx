import React, { useState, useContext, useState } from "react";
const Context = React.createContext();

export function useForm() {
  return useContext(Context);
}

export default function FormContext({ children }) {
  const [rowData, setRowData] = useState([]);
  const [productName, setProductName] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();
  const [stock, setStock] = useState();
  const [image, setImage] = useState();

  const context_value = {
    rowData,
    setRowData,
    productName,
    setProductName,
    description,
    setDescription,
    price,
    setPrice,
    stock,
    setStock,
    image,
    setImage,
  };

  return <Context value={context_value}>{children}</Context>;
}
