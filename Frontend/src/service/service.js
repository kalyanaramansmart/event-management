import { api } from "./client";

export const signupApi = async (data) => {
  return await api("/api/users/register", {
    method: "post",
    data,
  });
};

export const loginApi = async (data) => {
  return await api("/api/users/login", {
    method: "post",
    data,
  });
};

export const getCategoriesApi = async () => {
  return await api("/api/category");
};

export const createCategoryApi = async (data) => {
  return await api("/api/category", {
    method: "post",
    data,
  });
};

export const updateCategoryApi = async (id, data) => {
  return await api(`/api/category/${id}`, {
    method: "put",
    data,
  });
};

export const deleteCategoryApi = async (id) => {
  return await api(`/api/category/${id}`, {
    method: "delete",
  });
};

export const getCategoryByIdApi = async (id) => {
  return await api(`/api/category/${id}`);
};

export const createEventApi = (data) => {
  return api("/api/events", {
    method: "post",
    data,
  });
};

export const updateEventApi = (id, data) => {
  return api(`/api/events/${id}`, {
    method: "put",
    data,
  });
};

export const deleteEventApi = (id) => {
  return api(`/api/events/${id}`, {
    method: "delete",
  });
};

/* USER */
export const bookUnbookEventApi = (id) => {
  return api(`/api/events/${id}`, {
    method: "patch",
  });
};

export const getEventByIdApi = (id) => {
  return api(`/api/events/${id}`);
};

export const getEventApi = (category, weekoffset) => {
  return api(`/api/events?weekOffset=${weekoffset}&category=${category}`, {
    method: "get",
  });
};
