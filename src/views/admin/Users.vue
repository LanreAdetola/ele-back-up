<template>
  <div class="admin-users">
    <h1>{{ $t('admin.users.title') }}</h1>

    <table>
      <thead>
        <tr>
          <th>{{ $t('admin.users.id') }}</th>
          <th>{{ $t('admin.users.email') }}</th>
          <th>{{ $t('admin.users.role') }}</th>
          <th>{{ $t('admin.users.created') }}</th>
          <th>{{ $t('admin.users.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
          <td>
            <button @click="changeRole(user.id)">{{ $t('admin.users.promote') }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const users = ref([])

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at, auth:users(email)')

  if (error) return console.error(error)

  users.value = data.map(u => ({
    id: u.user_id,
    email: u.auth.email,
    role: u.role,
    created_at: u.created_at
  }))
}

const changeRole = async (userId) => {
  const { error } = await supabase
    .from('user_roles')
    .update({ role: 'admin' })
    .eq('user_id', userId)

  if (!error) fetchUsers()
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-users {
  padding: 2rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
th {
  background: #f8f8f8;
}
button {
  margin-right: 0.5rem;
}
</style>
