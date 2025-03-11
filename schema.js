// Remove duplicate website schema
// const websiteSchema = {
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     "name": "Password Security Checker",
//     "url": "https://passmatrics.pages.dev/",
//     "description": "Analyze your password strength with our advanced security tool. Features real-time analysis, crack-time estimation, entropy calculation, and expert tips. 100% secure, client-side processing.",
//     "publisher": {
//         "@type": "Organization",
//         "name": "PassMetrics",
//         "logo": {
//             "@type": "ImageObject",
//             "url": "https://passmatrics.pages.dev/logo.png"
//         }
//     },
//     "potentialAction": {
//         "@type": "SearchAction",
//         "target": {
//             "@type": "EntryPoint",
//             "urlTemplate": "https://passmatrics.pages.dev/?q={search_term_string}"
//         },
//         "query-input": {
//             "@type": "PropertyValueSpecification",
//             "valueRequired": true,
//             "valueName": "search_term_string"
//         }
//     }
// };

// FAQ schema
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is password entropy, and why is it important?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Password entropy measures the randomness and complexity of your password. A higher entropy score means your password is more secure and harder for attackers to guess using brute-force methods. It is essential to increase your password's entropy to protect against potential breaches."
            }
        },
        {
            "@type": "Question",
            "name": "How can I create a strong password?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A strong password should be long (12+ characters) and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Avoid using easily guessable information such as names, birthdays, or common words."
            }
        },
        {
            "@type": "Question",
            "name": "How do I check my password's strength?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can use an online password strength checker to instantly analyze the strength of your password. The tool provides an estimation of how long it would take to crack your password and gives feedback on its entropy and overall security."
            }
        },
        {
            "@type": "Question",
            "name": "Why is two-factor authentication (2FA) important?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Two-factor authentication (2FA) adds an extra layer of security by requiring a second form of verification (such as a code sent to your phone or email) in addition to your password. This significantly reduces the risk of unauthorized access, even if your password is compromised."
            }
        },
        {
            "@type": "Question",
            "name": "Should I use a password manager?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, a password manager helps you securely store and manage your passwords. It generates strong, unique passwords for each account and saves you from remembering them, all while keeping your data encrypted and safe."
            }
        },
        {
            "@type": "Question",
            "name": "How long does it take to crack a password?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cracking time depends on a password's length and complexity. Short, simple passwords may be cracked quickly, while strong passwords may take years or longer to break."
            }
        },
        {
            "@type": "Question",
            "name": "Can a password be too long?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Although longer passwords tend to be more secure, excessively long passwords can be impractical. Typically, a password length of 12–16 characters is ideal for balancing security and usability."
            }
        },
        {
            "@type": "Question",
            "name": "How often should I update my passwords?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "It's a good practice to update passwords every 3-6 months, or sooner if you suspect any account may have been compromised. Regularly changing passwords minimizes the risk of unauthorized access."
            }
        },
        {
            "@type": "Question",
            "name": "How can I protect myself from phishing attacks?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Avoid suspicious links, verify that websites use 'https', and consider using a password manager to reduce risk. Be cautious of emails asking for personal information or credentials."
            }
        }
    ]
};

// Create and append the schema.org JSON-LD scripts to the document
document.addEventListener('DOMContentLoaded', function() {
    // Organization Schema
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PassMetrics",
        "url": "https://passmetrics.pages.dev",
        "logo": "https://passmetrics.pages.dev/logo.png",
        "description": "A free, open-source password security analysis tool that helps users create stronger passwords with real-time strength evaluation.",
        "sameAs": [
            "https://github.com/reyhanhussain",
            "https://www.linkedin.com/in/reyhanhussain"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "email": "reyhanbgscet@outlook.com",
            "contactType": "customer service"
        },
        "founder": {
            "@type": "Person",
            "name": "Reyhan Hussain"
        },
        "foundingDate": "2023",
        "knowsAbout": [
            "Password Security",
            "Cybersecurity",
            "Password Entropy",
            "Password Strength Analysis",
            "Online Security"
        ],
        "offers": {
            "@type": "Offer",
            "name": "Password Security Analysis",
            "description": "Free password strength analysis with entropy calculation and crack time estimation",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    // Create and append the schema to the document
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(organizationSchema);
    document.head.appendChild(script);

    // WebSite Schema
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "PassMetrics",
        "url": "https://passmetrics.pages.dev",
        "description": "Analyze password strength with our security tool. Get real-time crack-time estimates, entropy scores, and risk evaluations.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://passmetrics.pages.dev/#search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    // Create and append the website schema to the document
    const websiteScript = document.createElement('script');
    websiteScript.type = 'application/ld+json';
    websiteScript.text = JSON.stringify(websiteSchema);
    document.head.appendChild(websiteScript);

    // SoftwareApplication Schema
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "PassMetrics",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": "Password strength analysis, Entropy calculation, Crack time estimation, Security recommendations"
    };

    // Create and append the software schema to the document
    const softwareScript = document.createElement('script');
    softwareScript.type = 'application/ld+json';
    softwareScript.text = JSON.stringify(softwareSchema);
    document.head.appendChild(softwareScript);

    // Add FAQ Schema
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);
}); 