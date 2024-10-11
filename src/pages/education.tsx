import React, {useEffect, useState} from "react";
import "../style.css"
import "./education.css"


const Education = () => {
    return (
        <>
            <div id="education-container">
                <div id="education-image-holder">
                    <img src="../images/education-page.png" alt="education-page-header" id="education-header"></img>
                </div>
                <h1><i>Scroll to check how to <a>SPOT</a> fake news</i></h1>
                <hr/>
                <h2><i>TO SPOT FAKE NEWS:</i></h2>
                <div id="steps-container">
                    <div className="steps-column">
                        <div className="steps-row">
                            <div id="step-one" className="step-container">
                                <div className="step-number">
                                    <img src="../images/1.png" className="number-icon"></img>
                                </div>
                                <div className="step-content">
                                    <h3>Check the source and the author</h3>
                                    <br/>
                                    <ul>
                                        <li>Is the author trustworthy/credible?</li>
                                        <li>Is the site reliable with fact-based content when visiting an article</li>
                                    </ul>
                                </div>
                            </div>
                            <div id="step-two" className="step-container">
                                <div className="step-number">
                                    <img src="../images/2.png" className="number-icon"></img>
                                </div>
                                <div className="step-content">
                                    <h3>Look for obvious signs</h3>
                                    <br/>
                                    <ul>
                                        <li>Check grammar, spelling mistakes, overall website design</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="steps-column">
                        <div className="steps-row">
                            <div id="step-three" className="step-container">
                                <div className="step-number">
                                    <img src="../images/3.png" className="number-icon"></img>
                                </div>
                                <div className="step-content">
                                    <h3>Check other sources to compare</h3>
                                    <br/>
                                    <ul>
                                        <li>Is same news being promoted by a reliable news company/agency?</li>
                                    </ul>
                                </div>
                            </div>
                            <div id="step-four" className="step-container">
                                <div className="step-number">
                                    <img src="../images/4.png" className="number-icon"></img>
                                </div>
                                <div className="step-content">
                                    <h3>Examine the evidence</h3>
                                    <br/>
                                    <ul>
                                        <li>If the evidence proves that something definitely happened?</li>
                                        <li>Have the facts been selected to back up a particular viewpoint?</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="steps-column">
                        <div className="steps-row">
                            <div id="step-five" className="step-container">
                                <div className="step-number">
                                    <img src="../images/5.png" className="number-icon"></img>
                                </div>
                                <div className="step-content">
                                    <h3>Use a fact-checking site</h3>
                                    <br/>
                                    <div className="step-content-row">
                                        <ul>
                                            <li>Snopes</li>
                                            <li>PolitiFact</li>
                                        </ul>
                                        <ul>
                                            <li>Fact Check</li>
                                            <li>BBC Reality check</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div id="step-six" className="step-container">
                                <div className="step-number">
                                    <img src="../images/6.png" className="number-icon"></img>
                                </div>
                                <div className="step-content">
                                    <h3>Develop a critical mindset</h3>
                                    <br/>
                                    <ul>
                                        <li>Train yourself to identify fake news instantly!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <br/>
                <cite>You can find more information on the above from <a
                    href="https://www.mindtools.com/a0g6bjj/how-to-spot-real-and-fake-news ">Mind Tools</a></cite>
                <br/>
                <hr/>
                <h2><i>Fake News Types</i></h2>
                <div id="three-column-container">
                    <div id="column-one">
                        <h4>Clickbait</h4>
                        <ul>
                            <li>Stories or images distorted to increase traffic to a page</li>
                        </ul>
                        <br/>
                        <h4>Propaganda</h4>
                        <ul>
                            <li>Stories or images created to mislead audience to fit a political agenda or biased
                                perspectives
                            </li>
                        </ul>
                    </div>
                    <div id="column-two">
                        <h4>Misleading headlines</h4>
                        <ul>
                            <li>Exaggerated headlines that may only be referred to a small portion of a greater story
                            </li>
                        </ul>
                        <br/>
                        <h4>Imposter content</h4>
                        <ul>
                            <li>Genuine news sources being impersonated presenting untrue stories</li>
                        </ul>
                    </div>
                    <div id="column-three">
                        <h4>Satire or parody</h4>
                        <ul>
                            <li>Articles written for entertainment</li>
                        </ul>
                        <br/>
                        <h4>Poor quality journalism</h4>
                        <ul>
                            <li>Can appear in many forms but can include lack of checking facts, biased takes on topics,
                                plagiarism, etc
                            </li>
                        </ul>
                    </div>
                </div>
                <h2><i>Misinformation vs Disinformation</i></h2>
                <table>
                    <tr>
                        <th>Misinformation</th>
                        <th>Disinformation</th>
                    </tr>
                    <tr>
                        <td>False or misleading stories that are <strong>created and spread on purpose</strong>, usually
                            by someone with a financial or political reason for doing it.
                        </td>
                        <td>False or inaccurate stories that <strong>might not have been intentionally created or
                            shared</strong> to deceive, but still end up spreading misinformation.
                        </td>
                    </tr>
                </table>
                <br/>
                <cite>You can find more information on the above from <a
                    href={"https://www.kaspersky.com/resource-center/preemptive-safety/how-to-identify-fake-news"}>kapersky.com</a></cite>
                <br/>
                <hr/>
                <h2><i>Fake News</i></h2>
                <h4>What is Fake News?</h4>
                <p>Fake news can be defined as any news that does not completely portray the truth.</p>
                <p>Some features of fake news include:
                    <ul>
                        <li>Often include exaggerated claims or stories that induce a form of alarm or evoke emotion
                        </li>
                        <li>Involve the use of Deepfakes - fake videos created with software and machine learning to
                            create footage of scenes or events that have never occurred
                        </li>
                    </ul>
                </p>
                <cite>You can find more information on the above from <a
                    href={"https://www.kaspersky.com/resource-center/preemptive-safety/how-to-identify-fake-news"}>kapersky.com</a></cite>
                <hr/>
                <br/>
                <div id="recommendations-container">
                    CCNN :)
                </div>
            </div>

        </>
    );
};

export default Education;

