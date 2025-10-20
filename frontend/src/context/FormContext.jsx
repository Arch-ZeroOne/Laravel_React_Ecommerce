import React, { useState, useContext } from "react";
const Context = React.createContext();

export function useForm() {
  return useContext(Context);
}

export default function FormContext({ children }) {
  const [id, setId] = useState();
  const [rowData, setRowData] = useState([]);
  const [productName, setProductName] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();
  const [stock, setStock] = useState();
  const [image, setImage] = useState();
  const [status, setStatus] = useState();

  const context_value = {
    id,
    setId,
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
    status,
    setStatus,
  };

  return <Context value={context_value}>{children}</Context>;
}
