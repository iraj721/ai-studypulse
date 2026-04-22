import React from "react";

export default function Spinner({ message = "Loading..." }) {
  return (
    <div className="text-center my-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="text-muted mt-2">{message}</p>
    </div>
  );
}
