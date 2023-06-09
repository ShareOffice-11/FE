import instance from './instance/instance';

const getMainPosts = async payload => {
  try {
    const { data } = await instance.get('api/posts', {
      params: payload,
    });
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

const postMainLike = async id => {
  try {
    await instance.post(`api/posts/${id}/likes`);
  } catch (error) {
    throw new Error(error);
  }
};

const postAddPost = async payload => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const formData = new FormData();
  const sendData = { ...payload };
  delete sendData.imageList;

  const postBlob = new Blob([JSON.stringify(sendData)], {
    type: 'application/json',
  });

  formData.append('postRequestDto', postBlob);
  payload.imageList.forEach(image => {
    const imageBlob = new Blob([image.file], {
      type: image.type,
    });
    formData.append('imageFile', imageBlob, image.file.name || image);
  });

  try {
    const { data } = await instance.post(`api/posts`, formData, config);
    return data.message;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePost = async id => {
  try {
    const { data } = await instance.delete(`/api/posts/${id}`);
    return data.message;
  } catch (error) {
    throw error.response.data;
  }
};

const putEditPost = async payload => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const formData = new FormData();
  const sendData = { ...payload };
  delete sendData.imageList;

  const postBlob = new Blob([JSON.stringify(sendData)], {
    type: 'application/json',
  });

  formData.append('postRequestDto', postBlob);
  payload.imageList.forEach(image => {
    const imageType = image.file.type.split('/')[1];
    const imageNameWithType = `${image.file}.${imageType}`;
    formData.append('imageFile', image.file, imageNameWithType);
  });

  try {
    const { data } = await instance.put(
      `/api/posts/${payload.postId}`,
      formData,
      config,
    );
    return data.message;
  } catch (error) {
    throw new Error(error);
  }
};

export { getMainPosts, postMainLike, postAddPost, deletePost, putEditPost };
