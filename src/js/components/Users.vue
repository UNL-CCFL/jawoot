<template>
  <div id="Users" class="app_content">
    <h2>Users</h2>
    <div id="subnav">
      <a href="#" @click.prevent='showSearch'><i class="fas fa-search"></i> Search</a>
      <router-link :to="{ name: 'UserNew'}" class=""><i class="fas fa-user-plus" title="New User"></i> New User </router-link>
    </div>
    <div v-if="message != null" class="alert">
      {{message}}
    </div>
    <div id="search" v-show="isSearching">
      <div class="form_field">
        <input type="text" v-model="searchingFor" v-on:keyup="searchUsers" placeholder="Search users..."/>
      </div>
    </div>
    <template v-if="Object.keys(users).length > 0">
      <div :class="'item_wrapper box '+($route.params.user_id == user.user_id ? 'selected' : '')" v-for="(user, index) in users">
        <div class="item_details">
          <h3>{{user.full_name}} <span class="username">({{user.username}})</span></h3>
        </div>
        <div class="item_actions">
          <router-link :to="{ name: 'UserEdit', params: {user_id:user.user_id} }" class=""><i class="fas fa-pencil-alt" title="Edit User"></i></router-link>
          <router-link :to="{ name: 'UserEdit', params: {user_id:user.user_id}, query: { delete: 1 } }" class=""><i class="fas fa-trash-alt" title="Delete Quiz"></i></router-link>
        </div>
      </div>
    </template>
    <template v-else-if="isSearching">
      <div>
        Sorry, no users match your search...
      </div>
    </template>
  </div>
</template>

<script>
  export default {
    name: "Users",
    data() {
      return {
        users: {},
        usersCache: {},
        fade: 'redBG',
        isSearching: false,
        searchingFor: '',
        message: null,
      }
    },
    created() {
      let self = this;
      axios.get(window.apiURI+"/api/users/")
        .then(function (response) {
          self.$set(self, 'users', response.data.users);
          self.$set(self, 'usersCache', response.data.users);
        },
      ).catch(error => {
        console.error("Users fetch error");
      });

      EventBus.$on('userUpdate', this.userUpdate);
      EventBus.$on('userDelete', this.userDelete);
    },
    methods: {
      userDelete(user) {
        this.$delete(this.users, user.user_id);
        this.$router.push({name: "Users"});
        this.message = "Successfully deleted "+user.full_name+" ("+user.username+")";
        let self = this;
        setTimeout(function(){ self.message = null}, 5000);
      },
      userUpdate(user) {
        for (let i in this.users) {
          if (this.users[i].user_id == user.user_id) {
            this.users[i] = user;
            return;
          }
        }
        this.$set(this.users, user.user_id, user);
      },
      showSearch() {
        this.isSearching = true;
        return false;
      },
      hideSearch() {
        this.isSearching = false;
        return false;
      },
      searchUsers() {
        if (this.searchingFor.length > 2) {
          this.$set(this, 'users', this.usersCache);
          let matches = {},
            searchingFor = this.searchingFor.toLowerCase();
          for (let i in this.users) {
            if (this.users[i].full_name.toLowerCase().indexOf(searchingFor) !== -1) {
              matches[this.users[i].user_id] = this.users[i];
            }
            else if (this.users[i].username.toLowerCase().indexOf(this.searchingFor) !== -1) {
              matches[this.users[i].user_id] = this.users[i];
            }
          }
          this.$set(this, 'users', matches);
        }
        else {
          this.users = this.usersCache;
        }

      },
    },
  }
</script>
