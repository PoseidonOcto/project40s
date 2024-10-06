import React, { useEffect, useState } from "react";
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
            <cite>You can find more information on the above from <a href="https://www.mindtools.com/a0g6bjj/how-to-spot-real-and-fake-news ">Mind Tools</a></cite>
            <br/>
            <hr/>
            <h2><i>Fake News Types</i></h2>
            <div id="three-column-container">
                <div id="column-one">
                    <h4>Clickbait</h4>
                    <ul><li>Stories or images distorted to increase traffic to a page</li></ul><br/>
                    <h4>Propaganda</h4>
                    <ul><li>Stories or images created to mislead audience to fit a political agenda or biased perspectives</li></ul>
                </div>
                <div id="column-two">
                    <h4>Misleading headlines</h4>
                    <ul><li>Exaggerated headlines that may only be referred to a small portion of a greater story</li></ul><br/>
                    <h4>Imposter content</h4>
                    <ul><li>Genuine news sources being impersonated presenting untrue stories</li></ul>
                </div>
                <div id="column-three">
                    <h4>Satire or parody</h4>
                    <ul><li>Articles written for entertainment </li></ul><br/>
                    <h4>Poor quality journalism</h4>
                    <ul><li>Can appear in many forms but can include lack of checking facts, biased takes on topics, plagiarism, etc</li></ul>
                </div>
            </div>
            <h2><i>Misinformation vs Disinformation</i></h2>
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
            <h2><i>Fake News</i></h2>
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
            <h3>Privacy</h3> {/* TODO need to write privacy / data usage disclaimer */}
            <p id={"disclaimer"}>Privacy Policy<br/>
                Last updated: September 15, 2024<br/>

                This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.<br/>

                We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the Free Privacy Policy Generator.<br/>

                Interpretation and Definitions<br/>
                Interpretation<br/>
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.<br/>

                Definitions<br/>
                For the purposes of this Privacy Policy:<br/>

                Application refers to Project40S, the software program provided by the Company.<br/>

                Company (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Project40S.<br/>

                Country refers to: Queensland, Australia<br/>

                Service refers to the Application.<br/>

                Service Provider means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.<br/>

                Usage Data refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).<br/>

                You means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.<br/>

                Collecting and Using Your Personal Data<br/>
                Types of Data Collected<br/>

                While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:<br/>

                Email address<br/>

                Usage Data<br/>

                Usage Data is collected automatically when using the Service.<br/>

                Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.<br/>

                We may also collect information that your browser sends whenever you visit our service or when you access the service by or through a mobile device.<br/>

                The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.<br/>

                Transfer of Your Personal Data<br/>

                We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.<br/>

                Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.<br/>

                Links to Other Websites<br/>

                Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.<br/>

                We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.<br/>

                Changes to this Privacy Policy<br/>

                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.<br/>

                Contact Us<br/>
                If you have any questions about this Privacy Policy, You can contact us:<br/>

                By email: octopus0246@gmail.com</p>
            </div>
        </>
    );
};

export default Education;

