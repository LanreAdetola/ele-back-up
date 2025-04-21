<template>
  <div class="user-profiles">
    <h1>User Profiles</h1>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <table v-if="profiles.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="profile in profiles" :key="profile.id">
          <td>{{ profile.id }}</td>
          <td>{{ profile.name }}</td>
          <td>{{ profile.email }}</td>
          <td>
            <button @click="editProfile(profile.id)">Edit</button>
            <button @click="deleteProfile(profile.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No profiles found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';

const profiles = ref([]);
const errorMessage = ref(null);

const fetchProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) throw error;

    profiles.value = data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    errorMessage.value = `Error fetching profiles: ${error.message}`;
  }
};

const editProfile = (id) => {
  // Redirect to an edit page or open a modal for editing
  console.log(`Edit profile with ID: ${id}`);
};

const deleteProfile = async (id) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    profiles.value = profiles.value.filter((profile) => profile.id !== id);
  } catch (error) {
    console.error('Error deleting profile:', error);
    errorMessage.value = `Error deleting profile: ${error.message}`;
  }
};

onMounted(() => {
  fetchProfiles();
});
</script>

<style scoped>
.user-profiles {
  padding: 2rem;
}
.error-message {
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin: 1rem 0;
  border: 1px solid #fed7d7;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}
th {
  background-color: #f7f7f7;
}
button {
  background: #2c5282;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}
button:hover {
  background: #2b6cb0;
}
</style>
