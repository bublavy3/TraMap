<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/creator">Create Map</router-link> |
      <router-link to="/login">Login</router-link> |
      <router-link to="/about">About</router-link>
    </nav>

    <router-view />
  </div>
</template>
