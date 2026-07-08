import React, { Component } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import URLS from "../utilities/Endpoints";

// Store the logout callback
let onLogoutCallback = null;

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect when the error comes from an auth endpoint (login, OTP, etc.)
      // — that 401 means wrong credentials, not an expired session.
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      const isAlreadyOnLogin = window.location.pathname === '/login';

      if (!isAuthEndpoint && !isAlreadyOnLogin) {
        console.log('Session expired (401). Redirecting to login.');
        if (onLogoutCallback) {
          onLogoutCallback();
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

class DatabaseService extends Component {
  static settings = {
    url: URLS.TAG_BASE_URL,
  };

  // Static method to set the logout callback
  static setLogoutCallback(callback) {
    onLogoutCallback = callback;
  }

  render() {
    return <div />;
  }

  // ✅ FIXED: Now accepts skipContentType parameter
  static generateHeaders(skipContentType = false) {
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Only add Content-Type for non-FormData requests
    if (!skipContentType) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  // ✅ FIXED: Detect FormData and adjust headers accordingly
  static async POST(end_point, post_data) {
    try {
      const isFormData = post_data instanceof FormData;
      
      console.log('🔍 DatabaseService POST:', {
        endpoint: end_point,
        isFormData,
        dataType: post_data?.constructor?.name
      });

      if (isFormData) {
        console.log('📤 Sending FormData (multipart/form-data)');
        // Log FormData contents for debugging
        for (let [key, value] of post_data.entries()) {
          if (value instanceof File) {
            console.log(`  📎 ${key}: [File: ${value.name}, ${value.size} bytes]`);
          } else {
            console.log(`  📄 ${key}: ${value}`);
          }
        }
      } else {
        console.log('📤 Sending JSON (application/json)');
      }

      const response = await axios.post(
        this.settings.url + end_point,
        post_data,
        {
          headers: this.generateHeaders(isFormData), // Skip Content-Type for FormData
        }
      );
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  static async POST_LOGIN(end_point, post_data) {
    try {
      const response = await axios.post(
        this.settings.url + end_point,
        post_data
      );
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  static async GET(end_point) {
    try {
      const response = await axios.get(this.settings.url + end_point, {
        headers: this.generateHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  static async DELETE(end_point, post_data) {
    try {
      const response = await axios.delete(this.settings.url + end_point, {
        headers: this.generateHeaders(),
        data: post_data,
      });
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  static async GET_STATUS(end_point) {
    try {
      const response = await axios.get(this.settings.url + end_point);
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  // ✅ FIXED: Detect FormData and adjust headers accordingly
  static async PUT(end_point, post_data) {
    try {
      const isFormData = post_data instanceof FormData;
      
      console.log('🔍 DatabaseService PUT:', {
        endpoint: end_point,
        isFormData,
        dataType: post_data?.constructor?.name
      });

      if (isFormData) {
        console.log('📤 Sending FormData (multipart/form-data)');
        // Log FormData contents for debugging
        for (let [key, value] of post_data.entries()) {
          if (value instanceof File) {
            console.log(`  📎 ${key}: [File: ${value.name}, ${value.size} bytes]`);
          } else {
            console.log(`  📄 ${key}: ${value}`);
          }
        }
      } else {
        console.log('📤 Sending JSON (application/json)');
      }

      const response = await axios.put(
        this.settings.url + end_point,
        post_data,
        {
          headers: this.generateHeaders(isFormData), // Skip Content-Type for FormData
        }
      );
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  static async PUT_LOGIN(end_point, post_data) {
    try {
      const response = await axios.put(
        this.settings.url + end_point,
        post_data
      );
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  static async GET_IP(end_point) {
    try {
      const response = await axios.get(end_point);
      return response.data;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  static errorHandler(error) {
    let errorMsg;
    if (error.response) errorMsg = error.response.data;
    else if (error.request) errorMsg = error.message;
    else errorMsg = "System error " + error.message;
    return errorMsg;
  }
}

export default DatabaseService;