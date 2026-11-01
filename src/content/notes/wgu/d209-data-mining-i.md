## Course Analysis
D209 felt like a continuation of [D208](/blog/wgu/d208-predictive-modeling/), focusing on more predictive modeling with different techniques. Thanks to the helpful DataCamp videos, it seemed easier than D208.

The first project in D209 had us apply K-Nearest Neighbors (KNN) classification or Naive Bayes for predictive modeling. The second project required a similar approach but with decision trees, random forests, or advanced regression methods. Unlike other classes, D209 didn't dictate the use of different data types for each task, allowing for consistency across projects.

My struggle with D208 Task 2 was a learning curve; my model's poor performance wasn't due to error but rather the data's limitations for logistic regression. In D209, I experimented with different models for the same outcome variable, and by Task 2, I improved my model's AUC score from 0.52 to 0.80—a satisfying progression.

For Task 1, I chose KNN classification to predict back pain using the medical dataset. The DataCamp unit on Machine Learning with scikit-learn was invaluable, and I wish I had it during D208. I refined my data preparation from previous classes and expanded my feature set. Dr. Elleh's webinar was instrumental, particularly his code for SelectKBest, which I preferred over DataCamp's method. It allowed me to choose features based on significance rather than just the top five.

I relied on the scikit-learn documentation for model specifics and Dr. Elleh's webinar for guidance. DataCamp's videos assisted with hyperparameter tuning and creating ROC AUC plots. I revisited my D208 Task 2 project for the classification report and confusion matrix, completing this project in just four days.

Task 2 led me to the DataCamp unit on Tree-Based Models in Python. I opted for a decision tree, which, while an improvement over the KNN model, was still a weak learner. This gave me the chance to apply Adaptive Boosting, enhancing the model's performance. Most of the task involved fine-tuning the decision tree and booster, which was time-consuming due to my initial confusion over the balance between n_estimators and learning_rate.

Despite the lengthy tuning process, I managed to refine my model and complete the analysis. The rubric required calculating Mean Squared Error, which isn't typically relevant for binary classification, but I complied. After addressing minor feedback regarding the explanation of decision trees and my expected outcomes I completed the final task required for this course.


## Final Thoughts
Compared to D208, this class was relatively easy only taking me a 3-4 days to pass from start to finish. Everything I did was done in Jupyter Notebook with Python and Dr.Elleh's webinar was the most helpful resources in understanding the task requirements.
