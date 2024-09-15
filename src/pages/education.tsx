import React, { useEffect, useState } from "react";
import "../style.css"


const Education = () => {
    return (
        <>
            <h1>Education</h1>
            <h3>Fake News Types</h3>
            <div id="two-column-container">
                <div id="column-one">
                    <ul>
                        <li><strong>Clickbait</strong></li>
                        <ul><li>Stories or images distorted to increase traffic to a page</li></ul>
                        <li><strong>Propaganda</strong></li>
                        <ul><li>Stories or images created to mislead audience to fit a political agenda or biased perspectives</li></ul>
                        <li><strong>Poor quality journalism</strong></li>
                        <ul><li>Can appear in many forms but can include lack of checking facts, biased takes on topics, plagiarism, etc</li></ul>
                    </ul>
                </div>
                <div id="column-two">
                    <ul>
                        <li><strong>Misleading headlines</strong></li>
                        <ul><li>Exaggerated headlines that may only be referred to a small portion of a greater story</li></ul>
                        <li><strong>Imposter content</strong></li>
                        <ul><li>Genuine news sources being impersonated presenting untrue stories</li></ul>
                        <li><strong>Satire or parody</strong></li>
                        <ul><li>Articles written for entertainment </li></ul>
                    </ul>
                </div>
            </div>
            <h3>Misinformation vs Disinformation</h3>
            <table>
                <tr>
                    <th>Misinformation</th>
                    <th>Disinformation</th>
                </tr>
                <tr>
                    <td>False or misleading stories that are <strong>created and spread on purpose</strong>, usually by someone with a financial or political reason for doing it.</td>
                    <td>False or inaccurate stories that <strong>might not have been intentionally created or shared</strong> to deceive, but still end up spreading misinformation. </td>
                </tr>
            </table>
            <br/>
            <cite>You can find more information on the above from <a href={"https://www.kaspersky.com/resource-center/preemptive-safety/how-to-identify-fake-news"}>kapersky.com</a></cite>
            <br/>
            <hr/>
            <h3>Fake News</h3>
            <h4>What is Fake News?</h4>
            <p>Fake news can be defined as any news that does not completely portray the truth.</p>
            <p>Some features of fake news include:
            <ul>
                <li>Often include exaggerated claims or stories that induce a form of alarm or evoke emotion</li>
                <li>Involve the use of Deepfakes - fake videos created with software and machine learning to create footage of scenes or events that have never occurred</li>
            </ul>
            </p>
            <cite>You can find more information on the above from <a href={"https://www.kaspersky.com/resource-center/preemptive-safety/how-to-identify-fake-news"}>kapersky.com</a></cite>
            <hr/>
            <br/>
            <h4>Spotting Fake News by&nbsp;
                <cite>
                    <a href="">Mind Tools
                    </a>
                </cite>
            </h4>
            <ol>
                <li>Check the source and the author</li>
                <ul>
                    <li>
                        (example: look closely to the author &rArr; is the author trustworthy/credible?  and site &rArr; is the site reliable with fact-based content when visiting an article)
                    </li>
                </ul>
                <li>
                    Look for signs of low-quality writing
                </li>
                <ul>
                    <li>
                        check grammar, spelling mistakes, overall website design
                    </li>
                </ul>
                <li>
                    Check other sources to compare
                </li>
                <ul>
                    <li>
                        Before believing in what the information of the content is sharing, try to ask yourself if the same news is being promoted by a reliable news company/agency? (such as CNN, BBC)
                    </li>
                </ul>
                <li>
                    Examine the evidence
                </li>
                <ul>
                    <li>
                        Look at grammar, spelling mistakes, overall website design. Does it seem trustworthy?
                    </li>
                </ul>
                <li>
                    Develop a critical mindset
                </li>
                <ul>
                    <li>
                        A credible news story should include plenty of acta, quotes from experts, survey data, critical thoughts, official statistics. Think about if the evidence proves that something definitely happened? Or, have the facts been selected to back up a particular viewpoint?
                    </li>
                </ul>
                <li>
                    Use a fact-checking site
                </li>
                <ul>
                    <li>

                    </li>
                </ul>
                <li>
                    Look for obvious sign
                </li>
                <ul>
                    <li>
                        Are there any overly large headings or weird images? Is there an abundance of ads on the websites
                    </li>
                </ul>
            </ol>
        </>
    );
};

export default Education;

