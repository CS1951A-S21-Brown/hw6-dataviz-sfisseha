# import csv
# import pandas as pd

# df= pd.read_csv("./data/video_games.csv")
# df= df.groupby(['Genre']).sum()
# df= df.drop(columns=["Rank", "Year"])
# df= df.rename(columns={"NA_Sales": "North America", "EU_Sales": "Europe", "JP_Sales": "Japan",  "Other_Sales": "Other regions",  "Global_Sales": "Global"})
# df.to_csv("./data/video_games_modified.csv")

import csv
import pandas as pd

df= pd.read_csv("./data/video_games.csv")
df= df.loc[df['Genre'] == 'Sports']
df= df.groupby(['Publisher']).sum()
print(df)
df= df.drop(columns=["Rank", "Platform", "Year", "Name", "NA_Sales", "EU_Sales", "JP_Sales",  "Other_Sales"])
# df= df.rename(columns={"Genre": "Count"})

# df.to_csv("./data/video_games_sports.csv")
# df.to_csv("./data/video_games_action.csv")
# df.to_csv("./data/video_games_platform.csv")
# df.to_csv("./data/video_games_rolePlaying.csv")
# df.to_csv("./data/video_games_puzzle.csv")
# df.to_csv("./data/video_games_misc.csv")
# df.to_csv("./data/video_games_shooter.csv")
# df.to_csv("./data/video_games_simulation.csv")
# df.to_csv("./data/video_games_racing.csv")
# df.to_csv("./data/video_games_fighting.csv")
# df.to_csv("./data/video_games_strategy.csv")
# df.to_csv("./data/video_games_adventure.csv")
df.to_csv("./data/video_games_sports_sales.csv")
