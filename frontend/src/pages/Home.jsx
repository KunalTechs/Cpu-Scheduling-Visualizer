import React from 'react';
import Hero from "../components/home/Hero"
import Banner from '../components/home/Banner';
import Features from '../components/home/Feature';
import CallToAction from '../components/home/CallToAction';
import Footer from '../components/home/Footer';


const Home =() =>{
    return (
        <>
        <Banner/>
        <Hero/>
        <Features/>
        <CallToAction/>
        <Footer/>
        </>
    )
}

export default Home;