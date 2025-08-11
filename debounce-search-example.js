// Frontend Debouncing Example for Device Search API
// This would be implemented in your React/Vue/vanilla JS frontend

/**
 * Debounce function - delays execution until after wait milliseconds 
 * have elapsed since the last time it was invoked
 */
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

/**
 * Search devices API call
 */
async function searchDevices(searchTerm, page = 1, limit = 20) {
  try {
    const response = await fetch(
      `/api/devices/search-devices?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth headers here
          // 'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

/**
 * Handle search results
 */
function handleSearchResults(results) {
  console.log('Search results:', results);
  // Update your UI with search results
  // Example: updateDeviceList(results.data);
  // Example: updatePagination(results.pagination);
}

/**
 * Handle search errors
 */
function handleSearchError(error) {
  console.error('Search failed:', error);
  // Show error message to user
  // Example: showErrorMessage('Search failed. Please try again.');
}

// Create debounced search function with 300ms delay
const debouncedSearch = debounce(async (searchTerm) => {
  if (searchTerm.length < 2) {
    // Clear results if search term is too short
    handleSearchResults({ data: [], pagination: { totalDevices: 0 } });
    return;
  }

  try {
    console.log(`Searching for: "${searchTerm}"`);
    const results = await searchDevices(searchTerm);
    handleSearchResults(results);
  } catch (error) {
    handleSearchError(error);
  }
}, 300); // 300ms delay

/**
 * Event handler for search input
 */
function onSearchInputChange(event) {
  const searchTerm = event.target.value.trim();
  
  // Call debounced search
  debouncedSearch(searchTerm);
}

// Usage Example:
// HTML: <input type="text" id="searchInput" placeholder="Search by IMEI, Device ID..." />

// JavaScript:
// document.getElementById('searchInput').addEventListener('input', onSearchInputChange);

/**
 * React Hook Example
 */
const ReactDebounceExample = `
import React, { useState, useEffect, useCallback } from 'react';

function DeviceSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          \`/api/devices/search-devices?search=\${encodeURIComponent(term)}\`
        );
        const data = await response.json();
        setResults(data.data || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Trigger search when searchTerm changes
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
      />
      
      {loading && <div>Searching...</div>}
      
      <div>
        {results.map(device => (
          <div key={device.device_inventory_id}>
            <strong>{device.device_id}</strong> - {device.imei}
          </div>
        ))}
      </div>
    </div>
  );
}
`;

/**
 * Vue.js Example
 */
const VueDebounceExample = `
<template>
  <div>
    <input
      v-model="searchTerm"
      @input="onSearchInput"
      placeholder="Search by IMEI, Device ID..."
    />
    
    <div v-if="loading">Searching...</div>
    
    <div v-for="device in results" :key="device.device_inventory_id">
      <strong>{{ device.device_id }}</strong> - {{ device.imei }}
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
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Set new timeout
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
          \`/api/devices/search-devices?search=\${encodeURIComponent(this.searchTerm)}\`
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
`;

console.log('Debounce examples created');
console.log('React Example:', ReactDebounceExample);
console.log('Vue Example:', VueDebounceExample);
