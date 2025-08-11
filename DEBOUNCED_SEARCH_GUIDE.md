# Debounced Device Search Implementation Guide

## Overview
This guide shows how to implement debounced search for the device search API to improve performance and user experience.

## Backend API

### Endpoint
```
GET /api/devices/search-devices
```

### Query Parameters
- `search` (required, min 2 chars): Search term
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Results per page

### Features
- **Optimized Search Results**: Prioritizes exact matches, then prefix matches, then partial matches
- **Minimum Search Length**: Requires at least 2 characters to prevent unnecessary queries
- **Cross-field Search**: Searches across IMEI, device_id, iradium_imei, and device_code
- **Case-insensitive**: Uses ILIKE for flexible matching

## Frontend Implementation

### 1. Vanilla JavaScript

```javascript
// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search function
async function searchDevices(searchTerm) {
  if (searchTerm.length < 2) return [];
  
  try {
    const response = await fetch(
      `/api/devices/search-devices?search=${encodeURIComponent(searchTerm)}`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Create debounced search (300ms delay)
const debouncedSearch = debounce(async (searchTerm) => {
  const results = await searchDevices(searchTerm);
  // Update your UI with results
  updateSearchResults(results);
}, 300);

// Usage
document.getElementById('searchInput').addEventListener('input', (e) => {
  debouncedSearch(e.target.value.trim());
});
```

### 2. React Implementation

```jsx
import React, { useState, useEffect, useCallback } from 'react';

function DeviceSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchDevices = async (term) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/devices/search-devices?search=${encodeURIComponent(term)}`
      );
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search with useCallback
  const debouncedSearch = useCallback(
    debounce(searchDevices, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by IMEI, Device ID..."
        className="search-input"
      />
      
      {loading && <div className="loading">Searching...</div>}
      
      <div className="results">
        {results.map(device => (
          <div key={device.device_inventory_id} className="device-item">
            <strong>{device.device_id}</strong>
            <span>{device.imei}</span>
            <span>{device.device_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Vue.js Implementation

```vue
<template>
  <div>
    <input
      v-model="searchTerm"
      @input="onSearchInput"
      placeholder="Search by IMEI, Device ID..."
      class="search-input"
    />
    
    <div v-if="loading" class="loading">Searching...</div>
    
    <div class="results">
      <div
        v-for="device in results"
        :key="device.device_inventory_id"
        class="device-item"
      >
        <strong>{{ device.device_id }}</strong>
        <span>{{ device.imei }}</span>
        <span>{{ device.device_type }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchTerm: '',
      results: [],
      loading: false,
      searchTimeout: null
    };
  },
  methods: {
    onSearchInput() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    },
    
    async performSearch() {
      if (this.searchTerm.length < 2) {
        this.results = [];
        return;
      }

      this.loading = true;
      try {
        const response = await fetch(
          `/api/devices/search-devices?search=${encodeURIComponent(this.searchTerm)}`
        );
        const data = await response.json();
        this.results = data.data || [];
      } catch (error) {
        console.error('Search error:', error);
        this.results = [];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## Performance Benefits

### 1. Debouncing Benefits
- **Reduces API Calls**: Only searches after user stops typing
- **Better UX**: Prevents flickering results during typing
- **Server Load**: Reduces unnecessary database queries
- **Network Efficiency**: Fewer HTTP requests

### 2. Backend Optimizations
- **Minimum Length**: 2-character minimum prevents overly broad searches
- **Smart Ordering**: Exact matches first, then prefix matches, then partial
- **Indexed Queries**: ILIKE queries can use database indexes effectively
- **Pagination**: Limits result set size for better performance

## Recommended Settings

- **Debounce Delay**: 300ms (good balance between responsiveness and efficiency)
- **Minimum Search Length**: 2 characters
- **Default Page Size**: 20 results
- **Maximum Page Size**: 100 results

## Example CSS

```css
.search-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
}

.search-input:focus {
  border-color: #007bff;
}

.loading {
  padding: 10px;
  text-align: center;
  color: #666;
}

.results {
  margin-top: 10px;
}

.device-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.device-item:hover {
  background-color: #f8f9fa;
}
```

## Testing the Implementation

1. **Type slowly**: Should see immediate results
2. **Type quickly**: Should see debounced results (300ms after stopping)
3. **Short terms**: Should show validation message for <2 characters
4. **Network monitoring**: Should see reduced API calls compared to no debouncing

This implementation provides an efficient, user-friendly search experience while minimizing server load and network traffic.
