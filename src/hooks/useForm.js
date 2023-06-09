import { useState } from 'react';

const useForm = initialState => {
  const [form, setForm] = useState(initialState);

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = e => {
    if (e) {
      const { name, files } = e.target;
      setForm({ ...form, [name]: files[0] });
    }
  };

  const reset = (resetState = initialState) => {
    setForm(resetState);
  };

  return [form, handleFormChange, handleFileChange, reset, setForm];
};

export default useForm;
