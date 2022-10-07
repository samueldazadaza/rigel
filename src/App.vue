<template>
  <div id="app">
    <input
      type="text"
      placeholder="Search"
      class="search-input"
      v-model="searchValue"
    />
    {{ searchValue }}

    <div v-for="(p, index) in post" :key="p.id">
      <table class="table table-hover table-bordered">
        <tbody>
          <tr>
            <th>{{ index + 1 }}</th>
            <td>{{ p.vehicle_code }}</td>
            <td>{{ p.system_name }}</td>
            <td>{{ p.issue_description }}</td>
          </tr>
        </tbody>

        <tbody></tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {},
  data() {
    return {
      post: [],
    };
  },
  methods: {
    getPosts() {
      fetch('https://api-rigel.herokuapp.com/')
        .then((response) => response.json())
        .then((data) => (this.post = data.data.data));
      //console.log(datos)
    },
  },
  mounted() {
    this.getPosts();
  },
  computed: {
    userList() {
      if (this.searchValue.trim().length >= 0) {
        return this.users.filter();
      }
      this.users;
    },
  },
};
</script>
