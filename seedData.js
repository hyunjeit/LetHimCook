const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const path = require('path');
const fs = require('fs');
const profilePicsFolder = path.join(__dirname, 'public/profilePics');

const seedDatabase = async () => {
  try {
    // Check if users exist
    const existingUsers = await User.find();
    
    if (existingUsers.length === 0) {
      const users = await User.insertMany([
        // Sample users
        { username: 'SweetTreatsMama', email: 'SweetTreatsMama', password: '$2b$10$s0OG1G/9FCdA9jUtcXWSGu017mmfbOp2Hvvdm1AsvqfXWR7J/QaVG',
          bio: '🍪 Baking my way through life! Sharing easy, homemade desserts that bring smiles to every bite. Let’s bake together! 💕😍'
         },
        { username: 'DadCooksDaily', email: 'DadCooksDaily', password: '$2b$10$sg3Ixbb3FpZIJXgorUPW3uju.pNCQZnpKrbfy4tPr0Hk6WEfQfQ4.',
          bio: 'Stay-at-home dad, home cook, and recipe sharer. 🍳👨‍🍳 Making meals with love, one dish at a time. Simple, delicious, and family-approved recipes. Let’s cook together! #DadInTheKitchen #HomeCooking'
        },
        { username: 'GrillMasterMike', email: 'GrillMasterMike', password: '$2b$10$eQ5T1dP90I4pWSUv2sCs3OBxSTikrUbSz7SkhcAfzbmsGSY8NgHbW',
          bio: '🔥 BBQ, grilling, and smoked meats – bringing the backyard flavor to your feed! Meat, fire, and a little bit of patience = perfection.'
         },
        { username: 'TheSpicySpoon', email: 'TheSpicySpoon', password: '$2b$10$vSNqMEom2VOM/wtvox4lyOxdWij2nPQIMfqv.bceqdi7WwSE/Ssnu',
          bio: '🌶️ Bringing the heat to your kitchen! Sharing bold, flavorful, and spice-packed recipes for those who love a little kick.'
         },
        { username: 'ChefInTrainingEm', email: 'ChefInTrainingEm', password: '$2b$10$8E1Of0S0w/8Y0S8vk.9UNebtF.DT4KlGdHmWWgjZvE5a4xhEhfta2',
          bio: '👩‍🍳 16 & dreaming of becoming a chef! Trying new recipes, making mistakes, and learning along the way. Let’s cook together! #FutureChef'
         },
      ]);
      console.log('Database seeded with initial users');
      
        // Check if posts exist
      const existingPosts = await Post.find();
      if (existingPosts.length === 0) {
        const posts = await Post.insertMany([
            // TODO: change to reflect the sample
          { author: users[0]._id, date: new Date(2024, 4, 31), header: 'The Cookie Dough Dilemma - To Chill or Not to Chill?',
            content: '1. Chilling = Less Spreading. Cold dough holds its shape better, giving you thick, chewy cookies instead of flat, sad ones 😥.<br>'+
            '2. More Flavor. Letting the dough sit allows the flavors to develop—kind of like marinating meat 🤣!<br>'+
            '3. Better Texture. The sugar has time to absorb moisture, leading to that crispy edge & soft center we all love 😍.<br><br>'+
            'Short on time? Chill for at least 30 minutes. But if you can, overnight is the best 😚!'
          },
          { author: users[0]._id, date: new Date(2024, 10, 17), header: 'Too Many Cookies... Help!', 
            content: 'Okay, I may have gone a bit overboard baking this weekend. 😅 My kitchen currently looks like a dessert factory, and I’m running out of counter space.<br><br>'+
            '<b>@DadCooksDaily</b>, do your kids want some extra cookies? Because mine are on a sugar high, and I can’t handle another round of “but Mom, just one more!!” 😵‍💫<br><br>'+
            '#BakingProblems #HelpMeEatThese #CookieOverload'
          },
          { author: users[1]._id, date: new Date(2025, 0, 19), header: '🍗 Easy One-Pan Garlic Butter Chicken 🕺',
            content: 'Busy dads (and moms), this one\'s for you! A quick, no-fuss meal that\'s packed with flavor and ready in under 30 minutes. Perfect for those hectic evenings when the little ones are running around!<br><br>'+
                      'Ingredients:<br><br>'+
                      '2 chicken breasts (or thighs for extra juiciness)<br>'+
                      '3 tbsp butter<br>'+
                      '4 cloves garlic, minced<br>'+
                      '1 tsp paprika<br>'+
                      '1/2 tsp salt & pepper<br>'+
                      '1/2 tsp dried thyme<br>'+
                      '1/2 tsp chili flakes (optional)<br>'+
                      '1/2 cup chicken broth<br>'+
                      '1 tbsp lemon juice<br>'+
                      'Instructions:<br>'+
                      '1️⃣ Season chicken with salt, pepper, paprika, and thyme.<br>'+
                      '2️⃣ Heat 1 tbsp butter in a pan over medium heat. Sear chicken on both sides until golden (about 4-5 mins per side). Remove & set aside.<br>'+
                      '3️⃣ In the same pan, add remaining butter and garlic. Sauté until fragrant.<br>'+
                      '4️⃣ Pour in chicken broth and lemon juice. Let it simmer for 2 mins, then add chicken back in.<br>'+
                      '5️⃣ Simmer for another 5 mins until chicken is cooked through. Spoon sauce over the top & enjoy!<br><br>'+
                      'Serve with rice, mashed potatoes, or veggies. My kids love it with roasted potatoes! Let me know if you try it! 🍽️<br><br>'+
                      '#DadCooksDaily #EasyDinners #HomeCooking #OnePanMeals',
            img: "garlic_butter.jpg"
          },
          { author: users[2]._id, date: new Date(2025, 1, 8), header: '🥩 Smoked Brisket – Low & Slow is the Way to Go! 🔥',
            content: 'Took me years to perfect this, but once you get it right, it’s a game-changer. Here’s my foolproof brisket method:<br><br>'+
                      'Ingredients:<br><br>'+
                      '12-14 lb whole beef brisket<br>'+
                      '1/4 cup coarse salt<br>'+
                      '1/4 cup black pepper<br>'+
                      '1 tbsp garlic powder<br>'+
                      '1 tbsp smoked paprika<br>'+
                      'Instructions:<br>'+
                      '1️⃣ Trim excess fat, leaving about 1/4 inch.<br>'+
                      '2️⃣ Rub brisket with salt, pepper, garlic powder & paprika.<br>'+
                      '3️⃣ Smoke at 225°F for 10-12 hours (until internal temp hits 203°F).<br>'+
                      '4️⃣ Wrap in butcher paper at 165°F for that perfect bark!<br>'+
                      '5️⃣ Let it rest for at least 1 hour before slicing.<br><br>'+
                      'Patience = juicy, tender brisket. 🤠🔥<br><br>'+
                      '#BBQLife #SmokedMeats #GrillSeason'
          },
          { author: users[3]._id, date: new Date(2024, 8, 29), header: 'I Have Made a Terrible Mistake… 🌶️🔥💀',
            content: '🚨 SEND HELP. 🚨 I just ate a whole Carolina Reaper, and I am currently reconsidering every life decision I have ever made. I thought I could handle it. I thought, "I eat spicy food all the time, I’ll be fine!" NO. I WAS NOT FINE.'
                          +'<br><br>Currently debating whether to chug a bottle of ranch dressing or just jump into a pool and hope for the best. Pray for me. 🙃🔥💦'
                          +'<br><br>#SpiceRegret #SendMilk #NeverAgain (jk, probably again)'
          },
          { author: users[4]._id, date: new Date(2024, 11, 3), header: 'My First Attempt at Homemade Pasta! 🍝',
            content: 'Okay, making fresh pasta from scratch is WAY harder than I thought. 😅 My kitchen is covered in flour, my arms are sore from kneading, and somehow there’s dough on my dog?? BUT… after a few failed attempts, I finally made a plate of silky, buttery fettuccine, and I feel like a real chef! 👩‍🍳✨'
                      +'<br><br>Next time, I’ll roll it thinner (because wow, my first batch was chunky 😂), but I’m calling this a win! Anyone have pasta-making tips for a beginner? 🍝'
                      +'<br><br>#ChefInTraining #HomemadePasta #FlourEverywhere',
            img: "homemade_pasta.jpg"
          }
        ]);
          console.log('Database seeded with initial posts');
      

        // Check if comments exist
        const existingComments = await Comment.find();
        if (existingComments.length === 0) {
          const comments = await Comment.insertMany([
            { author: users[1]._id, date: new Date(2024, 10, 18), 
              content: '@SweetTreatsMama Oh, you KNOW my kids would never say no to free cookies!' +
              '😂 But be warned—once they get a taste, they might start showing up at your door with puppy-dog eyes asking for more.<br><br>'+
              'Also… for totally unselfish reasons, I’ll take a few too. You know, just to quality check them. 😏🍪 #DadTax #SendCookies', 
              post: posts[1]._id 
            },
            { author: users[2]._id, date: new Date(2024, 0, 9), 
              content: 'Now THIS is my kind of weeknight meal! Simple, buttery, and packed with flavor. Might have to throw this on the grill and see how it turns out. 🔥',
              post: posts[2]._id 
            },
            { author: users[0]._id, date: new Date(2024, 0, 9), 
              content: 'Garlic + butter = magic! Also, if your kids eat all their chicken, I have some leftover cookies as a reward. Just saying. 😉',
              post: posts[2]._id 
            },
            { author: users[3]._id, date: new Date(2024, 0, 10), 
              content: 'Love it! But hear me out—what if we add a little cayenne and a drizzle of chili oil at the end?',
              post: posts[2]._id 
            },
            { author: users[4]._id, date: new Date(2024, 0, 10), 
              content: 'Omg, this looks so good!! I’ve never cooked chicken like this before, but I’m definitely trying it!',
              post: posts[2]._id 
            },
            { author: users[1]._id, date: new Date(2024, 0, 11), 
              content: 'Honestly, this meal is a lifesaver on busy nights. One pan, easy cleanup, and the kids actually eat it without too much negotiating.'+ 
              '😂 Pro tip: Make extra sauce because everyone’s gonna want to drizzle it over their rice or mashed potatoes!',
              post: posts[2]._id 
            }
          ]);
          console.log('Database seeded with initial comments');
        }
      }
      users.forEach(user => {
        const oldPath = path.join(profilePicsFolder, `${user.username}.jpg`);
        const newPath = path.join(profilePicsFolder, `${user._id}.jpg`);

        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed ${user.username}.jpg to ${user._id}.jpg`);
        } else {
            console.warn(`Profile picture for ${user.username} not found.`);
        }
    });
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
